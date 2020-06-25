import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { compose, curry } from 'ramda'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import moment from 'moment'
import {
  Col,
  Grid,
  Row,
} from 'former-kit'
import {
  createLinkRequest as createLinkRequestAction,
  nextStepRequest as nextStepRequestAction,
  previousStepRequest as previousStepRequestAction,
  resetStepsRequest as resetStepsRequestAction,
  getLinksRequest as getLinksRequestAction,
} from './actions'
import {
  NewLinksCard,
  PaymentLinkAdd,
  PaymentLinksFilter,
  PaymentLinksList,
} from '../../containers/PaymentLinks/List'
import { withError } from '../ErrorBoundary'

const defaultColumnSize = {
  desk: 12,
  palm: 12,
  tablet: 12,
  tv: 12,
}

const mapStateToProps = ({
  paymentLinks: {
    filter,
    loadingCreateLink,
    loadingGetLinks,
    paymentLinkUrl,
    paymentLinks,
    step,
    totalPaymentLinks,
  },
}) => ({
  filter,
  loadingCreateLink,
  loadingGetLinks,
  paymentLinks,
  paymentLinkUrl,
  step,
  totalPaymentLinks,
})

const mapDispatchToProps = {
  createLinkRequest: createLinkRequestAction,
  getLinksRequest: getLinksRequestAction,
  nextStepRequest: nextStepRequestAction,
  previousStepRequest: previousStepRequestAction,
  resetStepsRequest: resetStepsRequestAction,
}

const enhanced = compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
  withError
)

const firstStepDefaultData = {
  amount: '0',
  expiration_unit: 'days',
}

const boletoInputDefaultValues = {
  boleto_expires_in: undefined,
}

const creditCardInputDefaultValues = {
  free_installments: undefined,
  interest_rate: '0',
  max_installments: undefined,
}

const makeDefaulLinkData = () => ({
  boleto: false,
  credit_card: false,
  ...firstStepDefaultData,
  ...boletoInputDefaultValues,
  ...creditCardInputDefaultValues,
})

const steps = {
  error_step: {
    name: 'error_step',
    title: 'pages.payment_links.add_link.error.title',
  },
  first_step: {
    name: 'first_step',
    title: 'pages.payment_links.add_link.first_step.title',
  },
  second_step: {
    name: 'second_step',
    title: 'pages.payment_links.add_link.second_step.title',
  },
  success_step: {
    name: 'success_step',
    title: 'pages.payment_links.add_link.success.title',
  },
}

const today = moment().startOf('day')
const initialQueryData = {
  active: true,
  dates: {
    end: today,
    start: today.clone().subtract(1, 'month'),
  },
  inactive: true,
  name: '',
}

const PaymentLinks = ({
  createLinkRequest,
  filter,
  getLinksRequest,
  loadingCreateLink,
  loadingGetLinks,
  nextStepRequest,
  paymentLinkUrl,
  paymentLinks,
  previousStepRequest,
  resetStepsRequest,
  step,
  t,
  totalPaymentLinks,
}) => {
  const [linkFormData, setLinkFormData] = useState(makeDefaulLinkData())
  const [isNewLinkOpen, setIsNewLinkOpen] = useState(false)
  const [query, setQuery] = useState(initialQueryData)

  useEffect(() => {
    getLinksRequest({ ...filter, ...initialQueryData })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onQueryChange = curry((propName, value) => setQuery({
    ...query,
    [propName]: value,
  }))

  const onApplyQuery = () => getLinksRequest({
    ...filter,
    ...query,
    page: 1,
  })

  const onResetQuery = () => {
    setQuery(initialQueryData)
    return getLinksRequest({
      ...filter,
      ...initialQueryData,
      page: 1,
    })
  }

  const onPageCountChange = count => getLinksRequest({
    ...filter,
    count,
    page: 1,
  })

  const onPageNumberChange = page => getLinksRequest({
    ...filter,
    page,
  })

  const onOrderChange = ([sortField], sortOrder) => getLinksRequest({
    ...filter,
    sortField,
    sortOrder,
  })

  const handleLinkFormChange = (newData) => {
    let newFormData = { ...newData }

    if (newFormData.max_installments !== linkFormData.max_installments) {
      newFormData = Object.assign(
        newFormData,
        creditCardInputDefaultValues,
        { max_installments: newFormData.max_installments }
      )
    }

    if (!newFormData.boleto) {
      newFormData = Object.assign(
        newFormData,
        boletoInputDefaultValues
      )
    }

    if (!newFormData.credit_card) {
      newFormData = Object.assign(
        newFormData,
        creditCardInputDefaultValues
      )
    }

    setLinkFormData(newFormData)
  }

  const onAddPaymentLink = () => setIsNewLinkOpen(true)

  const onCreateLinkRequest = () => createLinkRequest(linkFormData)

  const onClosePaymentLink = () => {
    setLinkFormData(makeDefaulLinkData())
    resetStepsRequest()
    setIsNewLinkOpen(false)
  }

  const onCreateAnotherLink = () => {
    setLinkFormData(makeDefaulLinkData())
    resetStepsRequest()
  }

  const pagination = {
    offset: filter.count * filter.page,
    total: Math.ceil(totalPaymentLinks / filter.count),
  }

  return (
    <>
      <PaymentLinkAdd
        formData={linkFormData}
        isOpen={isNewLinkOpen}
        loading={loadingCreateLink}
        handleFormChange={handleLinkFormChange}
        onClose={onClosePaymentLink}
        onCreateAnotherLink={onCreateAnotherLink}
        onCreateLinkRequest={onCreateLinkRequest}
        onNextStep={nextStepRequest}
        onPreviousStep={previousStepRequest}
        paymentLink={paymentLinkUrl}
        step={steps[step]}
        t={t}
      />
      <Grid>
        <Row>
          <Col {...defaultColumnSize}>
            <NewLinksCard onAddPaymentLink={onAddPaymentLink} t={t} />
          </Col>
        </Row>
        <Row>
          <Col {...defaultColumnSize}>
            <PaymentLinksFilter
              onApply={onApplyQuery}
              onQueryChange={onQueryChange}
              onReset={onResetQuery}
              query={query}
              t={t}
            />
          </Col>
        </Row>
        <Row>
          <Col {...defaultColumnSize}>
            <PaymentLinksList
              loading={loadingGetLinks}
              onPageCountChange={onPageCountChange}
              onPageChange={onPageNumberChange}
              onRowClick={() => {}}
              pageCount={filter.count}
              pagination={pagination}
              onOrderChange={onOrderChange}
              order={filter.sortOrder}
              orderField={filter.sortField}
              t={t}
              rows={paymentLinks}
              selectedPage={filter.page}
            />
          </Col>
        </Row>
      </Grid>
    </>
  )
}

PaymentLinks.propTypes = {
  createLinkRequest: PropTypes.func.isRequired,
  filter: PropTypes.shape({
    count: PropTypes.number,
    page: PropTypes.number,
    sortField: PropTypes.string,
    sortOrder: PropTypes.string,
  }).isRequired,
  getLinksRequest: PropTypes.func.isRequired,
  loadingCreateLink: PropTypes.bool.isRequired,
  loadingGetLinks: PropTypes.bool.isRequired,
  nextStepRequest: PropTypes.func.isRequired,
  paymentLinks: PropTypes.arrayOf(PropTypes.shape()),
  paymentLinkUrl: PropTypes.string,
  previousStepRequest: PropTypes.func.isRequired,
  resetStepsRequest: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  totalPaymentLinks: PropTypes.number,
}

PaymentLinks.defaultProps = {
  paymentLinks: [],
  paymentLinkUrl: '',
  totalPaymentLinks: null,
}

export default enhanced(PaymentLinks)
