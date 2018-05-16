const types = {
  capture: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Captura pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Captura falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Captura em processamento',
      },
      success: {
        color: '#53be76',
        title: 'Capturada',
      },
    },
  },
  authorize: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Autorização pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Autorização falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Autorização em processamento',
      },
      success: {
        color: '#fcb20a',
        title: 'Autorizada',
      },
    },
  },
  refund: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Estorno pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Estorno falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Estorno em processamento',
      },
      success: {
        color: '#5b2886',
        title: 'Estornada',
      },
    },
  },
  chargeback_refund: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Reapresentação do chargeback pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Reapresentação do chargedback falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Reapresentação do chargeback em processamento',
      },
      success: {
        color: '#bf5316',
        title: 'Chargeback reapresentado',
      },
    },
  },
  chargeback: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Chargeback pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Chargeback falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Chargeback em processamento',
      },
      success: {
        color: '#f16518',
        title: 'Chargeback recebido',
      },
    },
  },
  issue: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Emissão pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Emissão falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Emissão em processamento',
      },
      success: {
        color: '#8c68d4',
        title: 'Boleto emitido',
      },
    },
  },
  analyze: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Análise de risco pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Análise de risco falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Análise de risco em processamento',
      },
      success: {
        color: '#4ca9d7',
        title: 'Análise de risco aprovada',
      },
    },
  },
  conciliate: {
    status: {
      deferred: {
        color: '#8c68d4',
        title: 'Conciliação pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Conciliação falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Conciliação em processamento',
      },
      success: {
        color: '#53be76',
        title: 'Boleto pago',
      },
    },
  },
  validate: {
    status: {
      deferred: {
        color: '#41535b',
        title: 'Validação do cartão pendente',
      },
      failed: {
        color: '#e00403',
        title: 'Validação do cartão falhou',
      },
      processing: {
        color: '#951d3c',
        title: 'Validação do cartão em processamento',
      },
      success: {
        color: '#951d3c',
        title: 'Cartão validado',
      },
    },
  },
}

export default types
