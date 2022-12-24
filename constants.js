const sessionUserTypes = {
  customer: 'customer',
  broker: 'broker',
  unknown: 'unknown',
};

const sessionSteps = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
};

const customerStepsForPlacingOrder = {
  one: 'source_address',
  two: 'exact_pickup_pincode',
  three: 'destination_address',
  four: 'exact_destination_pincode',
  five: 'volume',
  six: 'weight',
};

const simpleButtonListForUnknown = [
  {
    title: 'Customer',
    id: 'user_is_customer',
  },
  {
    title: 'Broker',
    id: 'user_is_broker',
  },
];
const simpleButtonListForCustomerWithExit = [
  {
    title: 'Place Order',
    id: 'place_order',
  },
  {
    title: 'Track Order',
    id: 'get_order_status',
  },
  {
    title: 'End Session',
    id: 'exit',
  },
];

const simpleButtonListForCustomer = [
  {
    title: 'Place Order',
    id: 'place_order',
  },
  {
    title: 'Track Order',
    id: 'get_order_status',
  },
];

const validReplyMessage =
  'Please select a valid reply to proceed further';

const sessionValidity = 30;

export default {
  sessionUserTypes: sessionUserTypes,
  sessionSteps: sessionSteps,
  sessionValidity: sessionValidity,
  simpleButtonListForUnknown: simpleButtonListForUnknown,
  simpleButtonListForCustomer: simpleButtonListForCustomer,
  simpleButtonListForCustomerWithExit:
    simpleButtonListForCustomerWithExit,
  validReplyMessage: validReplyMessage,
  customerStepsForPlacingOrder: customerStepsForPlacingOrder,
};
