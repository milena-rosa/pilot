import { selectCompanyFees } from './reducer'

const companyFactory = mdrs => ({
  pricing: {
    gateway: {
      test: {
        antifraud_cost: [
          {
            cost: 70,
            name: 'pagarme',
          },
        ],
        boletos: {
          payment_fixed_fee: 380,
          payment_spread_fee: 0,
        },
        minimum_monthly_payment: 0,
        transaction_cost: {
          boleto: 0,
          credit_card: 50,
          debit_card: 50,
        },
        transaction_spread: {
          boleto: 0,
          credit_card: 0,
          debit_card: 1.5,
        },
      },
    },
    psp: {
      test: {
        anticipation: 3.14,
        mdrs,
      },
    },
    transfers: {
      credito_em_conta: 0,
      doc: 367,
      inter_recipient: 0,
      ted: 367,
    },
  },
})

describe('selectCompanyFees', () => {
  describe('when company has 1, 2 and 7 installments', () => {
    const company = companyFactory([{
      installments: [
        { installment: 1, mdr: 3.79 },
        { installment: 2, mdr: 4.19 },
        { installment: 7, mdr: 4.59 },
      ],
      payment_method: 'credit_card',
    }])

    const fees = selectCompanyFees(company)

    it('should return the correct response', () => {
      expect(fees).toEqual({
        anticipation: 3.14,
        antifraud: 70,
        boleto: 380,
        gateway: 50,
        installments: [
          { installment: 1, mdr: 3.79 },
          { installment: 2, mdr: 4.19 },
          { installment: 7, mdr: 4.59 },
        ],
        transfer: 367,
      })
    })
  })

  describe('when company has 1 installments', () => {
    const company = companyFactory([{
      installments: [{ installment: 1, mdr: 3.79 }],
      payment_method: 'credit_card',
    }])

    const fees = selectCompanyFees(company)

    it('should return the correct response', () => {
      expect(fees).toEqual({
        anticipation: 3.14,
        antifraud: 70,
        boleto: 380,
        gateway: 50,
        installments: [{ installment: 1, mdr: 3.79 }],
        transfer: 367,
      })
    })
  })

  describe('when company has 1, 2 and 7 installments and payment_method is null', () => {
    const company = companyFactory([
      {
        installments: [],
        payment_method: 'debit_card',
      }, {
        installments: [
          { installment: 1, mdr: 3.79 },
          { installment: 2, mdr: 4.19 },
          { installment: 7, mdr: 4.59 },
        ],
        payment_method: null,
      }])

    const fees = selectCompanyFees(company)

    it('should return the correct response', () => {
      expect(fees).toEqual({
        anticipation: 3.14,
        antifraud: 70,
        boleto: 380,
        gateway: 50,
        installments: [
          { installment: 1, mdr: 3.79 },
          { installment: 2, mdr: 4.19 },
          { installment: 7, mdr: 4.59 },
        ],
        transfer: 367,
      })
    })
  })

  describe('when company has other installments types', () => {
    const company = companyFactory([{
      installments: [
        { installment: 1, mdr: 3.79 },
        { installment: 4, mdr: 4.19 },
        { installment: 8, mdr: 4.59 },
      ],
      payment_method: 'credit_card',
    }])

    const fees = selectCompanyFees(company)

    it('should return the correct response', () => {
      expect(fees).toEqual({
        anticipation: 3.14,
        antifraud: 70,
        boleto: 380,
        gateway: 50,
        installments: [],
        transfer: 367,
      })
    })
  })

  describe('when company has two credit_card installments types', () => {
    const company = companyFactory([
      {
        installments: [
          { installment: 1, mdr: 4.99 },
        ],
        payment_method: 'credit_card',
      },
      {
        installments: [
          { installment: 1, mdr: 3.79 },
          { installment: 2, mdr: 4.19 },
          { installment: 7, mdr: 4.59 },
        ],
        payment_method: 'credit_card',
      },
    ])

    const fees = selectCompanyFees(company)

    it('should return the correct response', () => {
      expect(fees).toEqual({
        anticipation: 3.14,
        antifraud: 70,
        boleto: 380,
        gateway: 50,
        installments: [{ installment: 1, mdr: 4.99 }],
        transfer: 367,
      })
    })
  })
})
