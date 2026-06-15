export const generateWhatsAppMessage = (
  type: 'reminder' | 'due_today' | 'friendly_late' | 'formal_late',
  data: { name: string; month: string; amount: string; dueDate: string; pixKey: string }
): string => {
  const { name, month, amount, dueDate, pixKey } = data;

  const messages: Record<string, string> = {
    reminder: `Olá, ${name}. Tudo bem?\nPassando para lembrar da taxa condominial referente a ${month}, no valor de R$ ${amount}, com vencimento em ${dueDate}.\nChave Pix do condomínio: ${pixKey}.\nApós o pagamento, por favor envie o comprovante. Obrigado!`,
    due_today: `Olá, ${name}. Tudo bem?\nLembramos que hoje é o dia de vencimento da taxa condominial referente a ${month}, no valor de R$ ${amount}.\nChave Pix: ${pixKey}.\nPor favor, realize o pagamento e envie o comprovante. Obrigado!`,
    friendly_late: `Olá, ${name}. Tudo bem?\nNotamos que a taxa condominial referente a ${month}, no valor de R$ ${amount}, venceu em ${dueDate} e ainda não consta pagamento.\nSe já pagou, por favor desconsidere e envie o comprovante.\nChave Pix: ${pixKey}.\nQualquer dúvida, estamos à disposição!`,
    formal_late: `Prezado(a) ${name},\nInformamos que a taxa condominial referente a ${month}, no valor de R$ ${amount}, encontra-se em atraso desde ${dueDate}.\nSolicitamos a regularização o mais breve possível.\nChave Pix: ${pixKey}.\nAtenciosamente, Administração do Condomínio.`,
  };

  return messages[type] || messages.reminder;
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 || cleaned.length === 10) {
    cleaned = '55' + cleaned;
  }
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};

export const openWhatsApp = (phone: string, message: string): void => {
  const link = generateWhatsAppLink(phone, message);
  window.open(link, '_blank');
};
