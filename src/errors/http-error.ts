const ERROR_401 = {
  title: '401 Unauthorized',
  description: 'The request requires authentication. ',
  http_status: '401',
};

const ERROR_404 = {
  title: '404 Not Found',
  description: 'The requested resource was not found on the server',
  http_status: '404',
};

const ERROR_406 = {
  title: '406 Not Acceptable',
  description: 'HTTP header "Accept" contains an invalid content type',
  http_status: '406',
};

const ERROR_416 = {
  title: '413 Requested Range Not Satisfiable',
  description: 'HTTP header "Range" contains an unsatisfiable item range',
  http_status: 416,
};

const ERROR_500 = {
  title: '500 Internal Server Error',
  description: 'An internal server error has occured',
  http_status: 500,
};

const HttpError: any = {
  ERROR_404, ERROR_406, ERROR_416, ERROR_500,
};

export default HttpError;
