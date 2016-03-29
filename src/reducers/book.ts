const initialState = {
  url: null,
  data: null,
  isFetching: false,
  fetchError: null,
  editError: null
};

export default (state = initialState, action) => {

  switch (action.type) {
    case "FETCH_BOOK_ADMIN_REQUEST":
      return Object.assign({}, state, {
        url: action.url,
        isFetching: true,
        fetchError: null
      });

    case "EDIT_BOOK_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        editError: null
      });

    case "LOAD_BOOK_ADMIN":
      return Object.assign({}, state, {
        url: action.url,
        data: action.data,
        isFetching: false
      });

    case "FETCH_BOOK_ADMIN_FAILURE":
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false
      });

    case "EDIT_BOOK_FAILURE":
      return Object.assign({}, state, {
        editError: action.error,
        isFetching: false
      });

    default:
      return state;
  }
};