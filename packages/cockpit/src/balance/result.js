import {
  __,
  always,
  apply,
  applySpec,
  assoc,
  either,
  ifElse,
  isEmpty,
  isNil,
  join,
  juxt,
  map,
  negate,
  path,
  pathEq,
  pipe,
  pluck,
  prop,
  reduce,
  subtract,
  sum,
  when,
} from 'ramda'

const getWithDv = propName => pipe(
  juxt([
    path(['bank_account', propName]),
    path(['bank_account', `${propName}_dv`]),
  ]),
  join('-')
)

const buildRecipient = pipe(
  prop('recipient'),
  applySpec({
    id: prop('id'),
    name: path(['bank_account', 'legal_name']),
    bank_account: {
      account: getWithDv('conta'),
      agency: getWithDv('agencia'),
      bank_code: path(['bank_account', 'bank_code']),
      id: path(['bank_account', 'id']),
      type: path(['bank_account', 'type']),
    },
  })
)

const buildBalance = applySpec({
  amount: path(['balance', 'available', 'amount']),
  available: {
    anticipation: path(['bulk_anticipations_limit', 'maximum', 'amount']),
    withdrawal: path(['balance', 'available', 'amount']),
  },
  outcoming: path(['balance', 'waiting_funds', 'amount']),
})

const calculateRequestAmount = pipe(
  juxt([
    prop('amount'),
    pipe(prop('anticipation_fee'), negate),
    pipe(prop('fee'), negate),
  ]),
  sum
)

const buildRequests = pipe(
  prop('bulk_anticipations_pending'),
  map(applySpec({
    amount: calculateRequestAmount,
    created_at: prop('date_created'),
    id: prop('id'),
    type: always('anticipation'),
  }))
)

const buildTotal = direction => pipe(
  prop('per_day'),
  reduce((acc, val) => {
    const available = val.available.amount[direction]
    const fee = val.available.fee[direction]

    return acc + (available - fee)
  }, 0)
)

const getOutgoing = pipe(
  buildTotal('out'),
  negate
)

const buildSearchTotal = applySpec({
  net: pipe(
    juxt([buildTotal('in'), getOutgoing]),
    apply(subtract)
  ),
  outcoming: buildTotal('in'),
  outgoing: getOutgoing,
})

const getOperationDate = dateType => pipe(
  path(['movement_object', dateType]),
  when(
    either(isNil, isEmpty),
    always(null)
  )
)

const transformMovementTypePropTo = (propName, to = propName) => pipe(
  path(['movement_object', propName]),
  when(either(isNil, isEmpty), always(0)),
  assoc('amount', __, { type: to })
)

const buildOperationOutcoming = ifElse(
  pathEq(['movement_object', 'type'], 'refund'),
  juxt([
    transformMovementTypePropTo('fee', 'mdr'),
  ]),
  juxt([
    transformMovementTypePropTo('amount', 'payable'),
  ])
)

const buildOperationOutgoing = ifElse(
  pathEq(['movement_object', 'type'], 'refund'),
  juxt([
    transformMovementTypePropTo('amount', 'payable'),
    transformMovementTypePropTo('anticipation_fee'),
  ]),
  juxt([
    transformMovementTypePropTo('fee', 'mdr'),
    transformMovementTypePropTo('anticipation_fee'),
  ])
)

const buildOperationsRows = pipe(
  prop('operations'),
  map(applySpec({
    id: prop('id'),
    net: pipe(
      juxt([
        pipe(buildOperationOutcoming, pluck('amount'), sum),
        pipe(buildOperationOutgoing, pluck('amount'), sum),
      ]),
      apply(subtract)
    ),
    outcoming: buildOperationOutcoming,
    outgoing: buildOperationOutgoing,
    payment_date: {
      actual: getOperationDate('payment_date'),
      original: getOperationDate('original_payment_date'),
    },
    type: path(['movement_object', 'type']),
  }))
)

const buildResult = query => applySpec({
  query: always(query),
  result: {
    balance: buildBalance,
    recipient: buildRecipient,
    requests: buildRequests,
    search: {
      operations: {
        count: always(100),
        offset: always(0),
        rows: buildOperationsRows,
        total: always(1000),
      },
      total: buildSearchTotal,
    },
  },
})

export default buildResult
