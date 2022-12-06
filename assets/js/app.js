// In this file you'll find the JS code
// implemented for the AwesomeBoks App

// -- allBooks - collection that keeps a list of books -- //
const allBooks = [];

// -- bookExists - checks if the book already exists in the collection -- //
function bookExists(newBook) {
  return allBooks.some((book) => book.title === newBook.value);
}

// -- createBook - creates a book object -- //
function createBook(bookInputs) {
  const book = { };

  bookInputs.forEach((bookInput) => {
    book[bookInput.id] = bookInput.value;
  });

  return book;
}

// -- insertBook - adds the book into the collection -- //
function insertBook(book) {
  allBooks.push(book);
  return book;
}

// -- displayBook - after getting title/author valid entries the book is displayed -- //
function displayBook(formInputs) {
  const newBook = createBook(Array.from(formInputs));
  console.log(insertBook(newBook));
}

// -- showInputError - display and error if title/author are invalid -- //
function showInputError(invalidInput) {
  if (invalidInput.validity.valueMissing) {
    invalidInput.setCustomValidity(`Book ${invalidInput.placeholder} is required and can't be empty.`);
  } else if (invalidInput.validity.tooShort) {
    invalidInput.setCustomValidity(`Book ${invalidInput.placeholder} length must be 6 chars at least.`);
  } else if (invalidInput.validity.patternMismatch) {
    invalidInput.setCustomValidity(`Book ${invalidInput.placeholder} can't start or end with spaces.`);
  } else if (invalidInput.validity.customError) {
    invalidInput.setCustomValidity(`The Book ${invalidInput.value} already exists. No duplicates allowed.`);
    invalidInput.value = '';
  } else {
    invalidInput.setCustomValidity('');
  }
  invalidInput.focus();
  invalidInput.reportValidity();
}

// -- booksList - <ul> that contains the list of books -- //
const addBook = document.forms.addbook;

// -- onFormSubmit - the book is added or an error is displayed -- //
addBook.addEventListener('submit', (e) => {
  e.preventDefault();

  if (e.target.checkValidity()) {
    const checkTitle = e.target.querySelector('#title');
    if (bookExists(checkTitle)) {
      checkTitle.setCustomValidity(`The Book already exists.`);
      showInputError(checkTitle);
    } else {
      // checkTitle.setCustomValidity('');
      displayBook(e.target.querySelectorAll('input:valid'));
    }
  } else {
    showInputError(e.target.querySelector(':invalid'));
  }
});