// src/lib/tracking.ts (renomear de tranking.ts)
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Rastreia a visualização de um item.
 * @param itemName // Nome do item visualizado
 * @param itemType // Tipo do item (ex: 'course', 'news')
 *
 * Exemplo de uso:
 * trackView('Curso de JavaScript', 'course');
 */
export function trackView(itemName: string, itemType: 'course' | 'news') {
  // console.log(`📊 Visualizado: ${itemType} - ${itemName}`);
  window.gtag?.('event', 'view_item', {
    item_name: itemName,
    item_type: itemType,
  });
}

/**
 * Rastreia o clique em um item.
 * @param itemName // Nome do item clicado
 * @param itemType // Tipo do item (ex: 'course', 'news')
 *
 * Exemplo de uso:
 * trackClick('Curso de JavaScript', 'course');
 */
export function trackClick(itemName: string, itemType: 'course' | 'news') {
  // console.log(`📈 Clicado: ${itemType} - ${itemName}`);
  window.gtag?.('event', 'select_item', {
    item_name: itemName,
    item_type: itemType,
  });
}

/**
 * Rastreia o clique no botão de WhatsApp.
 * @param source // Origem do clique (ex: 'floating-whatsapp')
 * @param message // Mensagem opcional para rastrear
 *
 * Exemplo de uso:
 * trackClickWhatsapp('floating-whatsapp', 'Contato via WhatsApp');
 */
export function trackClickWhatsapp(source: string, message?: string) {
  // console.log(`📞 WhatsApp clicado: ${source}`);
  window.gtag?.('event', 'whatsapp_click', {
    event_category: 'Contact',
    event_label: source,
    custom_parameters: {
      message_preview: message ? message.substring(0, 50) : undefined,
    },
  });
}

/**
 * Rastreia o envio de um formulário.
 * @param formName // Nome do formulário
 * @param success // Indica se o envio foi bem-sucedido
 * @param context // Contexto opcional do formulário
 *
 * Exemplo de uso:
 * trackFormSubmit('contact-form', true, {
 *   interest: 'Contabilidade Básica',
 *   item: 'course',
 *   formSource: 'course-detail-page'
 * });
 */
export function trackFormSubmit(
  formName: string,
  success: boolean = true,
  context?: {
    interest?: string; // Nome do curso/notícia de interesse
    item?: 'course' | 'news'; // Tipo do item de interesse
    formSource?: string; // De onde veio o formulário
    userType?: 'visitor' | 'student' | 'user';
  }
) {
  // console.log(`📝 Formulário enviado: ${formName} - ${success ? 'Sucesso' : 'Erro'}`);

  window.gtag?.('event', 'form_submit', {
    event_category: 'Form',
    event_label: formName,
    custom_parameters: {
      success,
      interest: context?.interest,
      item_type: context?.item,
      form_source: context?.formSource,
      user_type: context?.userType || 'visitor',
    },
  });
}

/**
 * Rastreia o clique em um botão específico.
 * @param buttonName // Nome do botão clicado
 * @param location // Localização do botão (opcional)
 *
 * Exemplo de uso:
 * trackClickButton('subscribe-newsletter', 'Footer');
 */
export function trackClickButton(buttonName: string, location?: string) {
  // console.log(`🖱️ Botão clicado: ${buttonName} em ${location || 'desconhecido'}`);
  window.gtag?.('event', 'click', {
    event_category: 'Button',
    event_label: buttonName,
    custom_parameters: { location },
  });
}

/**
 * Rastreia o envio do formulario de cadastro.
 * @param success // Indica se o cadastro foi bem-sucedido
 */
export function trackSignupFormSubmit(success: boolean) {
  // console.log(`📝 Formulário de cadastro enviado: ${success ? 'Sucesso' : 'Erro'}`);
  window.gtag?.('event', 'form_submit', {
    event_category: 'Form',
    event_label: 'signup',
    custom_parameters: { success },
  });
}
