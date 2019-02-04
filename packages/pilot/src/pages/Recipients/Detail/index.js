import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import withRouter from 'react-router-dom/withRouter'
import { connect } from 'react-redux'
import moment from 'moment'

import {
  assocPath,
  compose,
  pipe,
} from 'ramda'

import DetailRecipient from '../../../../src/containers/RecipientDetails'

const mockBalance = {
  disabled: false,
  onAnticipationClick: () => {},
  onCancel: () => {},
  onCancelRequestClick: () => {},
  onPageChange: () => {},
  onSave: () => {},
  onWithdrawClick: () => {},
  total: {
    net: 1000000,
    outcoming: 1000000,
    outgoing: 1000000,
  },
}

const mapStateToProps = (state = {}) => {
  const { account } = state
  const { client } = account || {}
  return { client }
}

const enhanced = compose(
  connect(mapStateToProps),
  translate(),
  withRouter
)

class DetailRecipientPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      anticipationLimit: 0,
      balance: {},
      currentPage: 1,
      dates: {
        end: moment().add(1, 'month'),
        start: moment(),
      },
      error: false,
      loading: true,
      recipientData: {},
    }

    this.fetchAnticipationLimit = this.fetchAnticipationLimit.bind(this)
    this.fetchBalance = this.fetchBalance.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.fetchRecipientData = this.fetchRecipientData.bind(this)
    this.handleDateFilter = this.handleDateFilter.bind(this)
    this.handleSaveAnticipation = this.handleSaveAnticipation.bind(this)
    this.handleSaveBankAccount = this.handleSaveBankAccount.bind(this)
    this.handleSaveBankAccountWithBank =
      this.handleSaveBankAccountWithBank.bind(this)
    this.handleSaveBankAccountWithId =
      this.handleSaveBankAccountWithId.bind(this)
    this.handleSaveTransfer = this.handleSaveTransfer.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  handleSaveAnticipation (data) {
    const { client } = this.props
    const { id } = this.props.match.params
    return client.recipient.update(id, { configuration: data })
      .then(() => {
        const updatedAnticipationConfig = assocPath(
          [
            'recipientData',
            'configurationData',
            'anticipation',
          ],
          data,
          this.state
        )
        this.setState(updatedAnticipationConfig)
      })
  }

  handleSaveTransfer (data) {
    const { client } = this.props
    const { id } = this.props.match.params

    return client.recipient.update(id, {
      configuration: {
        ...data,
        anticipationModel: null,
      },
    })
      .then(() => {
        const updatedTrasnferConfig = assocPath(
          [
            'recipientData',
            'configurationData',
            'transfer'],
          data,
          this.state
        )
        this.setState(updatedTrasnferConfig)
      })
  }

  handleSaveBankAccountWithId (data) {
    const { client } = this.props
    const { id } = this.props.match.params

    return client.recipient.update(id, { configuration: data })
  }

  handleSaveBankAccountWithBank (data) {
    const { client } = this.props
    const { id } = this.props.match.params

    const { identification } = this.state.recipientData.informationData
    const { documentType } = identification

    return client.recipient.createNewAccount({
      bankAccount: data,
      identification: {
        documentType,
        [documentType]: this.state.recipientData
          .informationData.identification[documentType],
      },
    })
      .then((bankAccountCreated) => {
        const { accounts } = this.state.recipientData.configurationData
        this.setState({
          recipientData: {
            ...this.state.recipientData,
            configurationData: {
              ...this.state.recipientData.configurationData,
              accounts: [...accounts, bankAccountCreated],
            },
          },
        })

        return client.recipient.update(id, {
          configuration: {
            id: bankAccountCreated.id,
          },
        })
      })
  }

  handleSaveBankAccount (data) {
    let operation = Promise.resolve()

    if (data.id) {
      operation = this.handleSaveBankAccountWithId(data)
    } else if (data.bank) {
      operation = this.handleSaveBankAccountWithBank(data)
    }
    return operation
      .then((dataUpdated) => {
        this.setState(pipe(
          assocPath(
            ['recipientData', 'configurationData', 'bankAccount'],
            dataUpdated.bank_account
          ),
          assocPath(
            ['recipientData', 'companyData', 'name'],
            dataUpdated.bank_account.name
          )
        ))
      })
  }

  handleDateFilter (dates) {
    const firstPage = 1
    return this.fetchBalance(dates, firstPage)
      .then((balance) => {
        this.setState({
          balance,
          currentPage: firstPage,
          dates,
        })
      })
  }

  fetchData () {
    const {
      currentPage,
      dates,
    } = this.state

    const recipientDataPromise = this.fetchRecipientData()
    const anticipationLimitPromise = this.fetchAnticipationLimit()
    const balancePromise = this.fetchBalance(dates, currentPage)

    return Promise.all([
      recipientDataPromise,
      anticipationLimitPromise,
      balancePromise,
    ])
      .then(([
        recipientData,
        anticipationLimit,
        balance,
      ]) => {
        this.setState({
          anticipationLimit,
          balance,
          loading: false,
          recipientData,
        })
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        })
      })
  }

  fetchRecipientData () {
    const { client } = this.props
    const { id } = this.props.match.params

    return client.recipient.detail(id)
      .then((recipient) => {
        const { identification } = recipient.informationData
        const accountsPromise = client.recipient.bankAccount(identification)
        return Promise.all([recipient, accountsPromise])
      })
      .then(([recipient, bankAccounts]) => {
        const { accounts } = bankAccounts
        const accountsPath = ['configurationData', 'accounts']
        const addAccounts = assocPath(accountsPath, accounts)
        const recipientData = addAccounts(recipient)
        return recipientData
      })
  }

  fetchAnticipationLimit () {
    const { client } = this.props
    const { id } = this.props.match.params
    return client.recipient.anticipationLimits(id)
      .then(limits => limits.maximum.amount)
  }

  fetchBalance (dates, page) {
    const { client } = this.props
    const { id } = this.props.match.params
    const query = { dates, page }

    return client.balance.data(id, query)
      .then(response => response.result)
  }

  render () {
    const {
      anticipationLimit,
      balance,
      currentPage,
      dates,
      error,
      loading,
      recipientData,
    } = this.state

    if (loading || error) return null

    const {
      companyData,
      configurationData,
      informationData,
    } = recipientData

    const { t } = this.props

    const anticipation = {
      available: anticipationLimit,
      error,
      loading,
    }

    return (
      <DetailRecipient
        informationProps={informationData}
        balanceProps={{
          ...mockBalance,
          ...balance,
          anticipation,
          currentPage,
          dates,
          onFilterClick: this.handleDateFilter,
        }}
        configurationProps={{
          ...configurationData,
          handleSaveAnticipation: this.handleSaveAnticipation,
          handleSaveBankAccount: this.handleSaveBankAccount,
          handleSaveTransfer: this.handleSaveTransfer,
        }}
        recipient={companyData}
        t={t}
      />
    )
  }
}

DetailRecipientPage.propTypes = {
  client: PropTypes.shape({
    recipient: PropTypes.shape({
      add: PropTypes.func.isRequired,
      bankAccount: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
}

export default enhanced(DetailRecipientPage)
