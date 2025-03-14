import { PrismaClient } from "@prisma/client";
import axios from "axios";
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// WhatsApp API configuration
const WHATSAPP_API_VERSION = 'v17.0';
const WHATSAPP_API_URL = 'https://graph.facebook.com';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Delay function for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Apply rate limiting
  try {
    await limiter(req, res);
  } catch {
    return res.status(429).json({ error: "Muitas requisições. Tente novamente mais tarde." });
  }

  // Validate environment variables
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error("Credenciais do WhatsApp não configuradas");
    return res.status(500).json({ error: "Configuração do WhatsApp incompleta" });
  }

  try {
    // Buscar contatos do banco de dados
    const contacts = await prisma.contact.findMany({
      where: {
        active: true, // Apenas contatos ativos
        phone: {
          not: null // Apenas contatos com número de telefone
        }
      }
    });

    if (!contacts.length) {
      return res.status(404).json({ message: "Nenhum contato encontrado para envio" });
    }

    const templateData = {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: "marco_antecipacao",
        language: { code: "pt_BR" }
      }
    };

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Enviar mensagens para cada contato com delay entre as chamadas
    for (const contact of contacts) {
      try {
        const formattedPhone = formatPhoneNumber(contact.phone);
        
        await axios.post(
          `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
          { ...templateData, to: formattedPhone },
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        results.success++;
        
        // Adiciona delay de 1 segundo entre as mensagens para evitar throttling
        await delay(1000);
      } catch (error) {
        results.failed++;
        results.errors.push({
          phone: contact.phone,
          error: error.response?.data?.error?.message || error.message
        });
        
        console.error(`Erro ao enviar mensagem para ${contact.phone}:`, 
          error.response?.data || error.message
        );
      }
    }

    return res.status(200).json({
      message: "Processo de envio concluído",
      results
    });
  } catch (error) {
    console.error("Erro ao processar envio de mensagens:", error);
    return res.status(500).json({ 
      error: "Erro ao processar envio de mensagens",
      details: error.message 
    });
  }
}

// Função para formatar número de telefone
function formatPhoneNumber(phone) {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Adiciona código do país se não existir
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
} 