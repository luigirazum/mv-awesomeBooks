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

// -- createTemplateBook - generate the HTML to insert the book in the DOMM -- //
function createTemplateBook(newBook) {
  const templateBook = `
    <p>${newBook.title}</p>
    <p>${newBook.author}</p>
    <button type="button">Remove</button>
    <hr>
    `;
  return templateBook;
}

// -- showInputError - display and error if title/author are invalid -- //
function showInputError(invalidInput) {
  if (!invalidInput.validity.customError) {
    if (invalidInput.validity.valueMissing) {
      invalidInput.setCustomValidity(`Book ${invalidInput.placeholder} is required and can't be empty.`);
    } else if (invalidInput.validity.tooShort) {
      invalidInput.setCustomValidity(`Book ${invalidInput.placeholder} length must be 6 chars at least.`);
    } else if (invalidInput.validity.patternMismatch) {
      invalidInput.setCustomValidity(`Book ${invalidInput.placeholder} can't start or end with spaces.`);
    } else {
      invalidInput.setCustomValidity('');
    }
  }
  invalidInput.focus();
  invalidInput.reportValidity();
}

// -- displayBook - after getting title/author valid entries the book is displayed -- //
function displayBook(form) {
  if (bookExists(form.elements.title)) {
    form.elements.title.setCustomValidity(`The Book ${form.elements.title.value} already exists. No duplicates allowed.`);
    showInputError(form.elements.title);
  } else {
    const newBook = createBook(Array.from(form.querySelectorAll('input')));
    const ulBooksList = document.getElementById('bookslist');
    const bookFragment = document.createDocumentFragment();
    const liBook = document.createElement('li');
    liBook.innerHTML = createTemplateBook(insertBook(newBook));
    bookFragment.appendChild(liBook);
    ulBooksList.appendChild(bookFragment);
    form.reset();
    form.elements.title.focus();
  }
}

// -- booksList - <ul> that contains the list of books -- //
const addBook = document.forms.addbook;

// -- onFormSubmit - the book is added or an error is displayed -- //
addBook.addEventListener('submit', (e) => {
  e.preventDefault();

  // -- with customError and not empty value we have to check again if the book exists -- //
  if (e.target.elements.title.value && e.target.elements.title.validity.customError) {
    e.target.elements.title.setCustomValidity('');
  }

  if (e.target.checkValidity()) {
    displayBook(e.target);
  } else {
    showInputError(e.target.querySelector(':invalid'));
  }
});