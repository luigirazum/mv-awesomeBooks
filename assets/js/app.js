// In this file you'll find the JS code
// implemented for the AwesomeBoks App

// -- allBooks - collection that keeps a list of books -- //
let allBooks = [];

// -- (f) saveBooks - save the books list into local storage -- //
function saveBooks() {
  localStorage.setItem('abData', JSON.stringify(allBooks));
}

// -- (f) bookExists - checks if the book already exists in the collection -- //
function bookExists(newBook) {
  return allBooks.some((book) => book.title.toLowerCase() === newBook.value.toLowerCase());
}

// -- (f) createBook - creates a book object -- //
function createBook(bookInputs) {
  const book = { };

  bookInputs.forEach((bookInput) => {
    book[bookInput.id] = bookInput.value;
  });

  return book;
}

// -- (f) insertBook - adds the book into the collection -- //
function insertBook(book) {
  allBooks.push(book);
  saveBooks();
  return book;
}

// -- (f) createTemplateBook - generate the HTML to insert the book in the DOMM -- //
function createTemplateBook(newBook) {
  const templateBook = `
    <p>${newBook.title}</p>
    <p>${newBook.author}</p>
    <button type="button">Remove</button>
    <hr>
    `;
  return templateBook;
}

// -- (f) showInputError - display and error if title/author are invalid -- //
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

// -- (f) displayBook - after getting title/author valid entries the book is displayed -- //
function displayBook(book) {
  const ulBooksList = document.getElementById('bookslist');
  const bookFragment = document.createDocumentFragment();
  const liBook = document.createElement('li');
  liBook.innerHTML = createTemplateBook(book);
  bookFragment.appendChild(liBook);
  ulBooksList.appendChild(bookFragment);
  return book;
}

// -- (f) deleteBook - deletes the book from the collection -- //
function deleteBook(selectedBook) {
  const previousBooks = allBooks.length;

  allBooks = allBooks.filter((book) => book.title.toLowerCase() !== selectedBook.toLowerCase());

  return (previousBooks !== allBooks.length);
}

// -- (f) removeBook - after deleting the book from the collection removes it from screen -- //
function removeBook(bookElement) {
  if (deleteBook(bookElement.firstElementChild.textContent)) {
    saveBooks();
    bookElement.parentNode.removeChild(bookElement);
  }
}
// -- addBook - form used to add a new book -- //
const addBook = document.forms.addbook;

window.addEventListener('load', () => {
  let abData = JSON.parse(localStorage.getItem('abData'));

  abData ??= [];

  if (abData.length > 0) {
    allBooks = abData;

    allBooks.forEach((book) => {
      displayBook(book);
    });
  }
});

// -- onFormSubmit - the book is added or an error is displayed -- //
addBook.addEventListener('submit', (e) => {
  e.preventDefault();

  // -- with customError and not empty value we have to check again if the book exists -- //
  if (e.target.elements.title.value && e.target.elements.title.validity.customError) {
    e.target.elements.title.setCustomValidity('');
  }

  if (e.target.checkValidity()) {
    const formElements = e.target.elements;
    if (bookExists(formElements.title)) {
      formElements.title.setCustomValidity(`The Book ${formElements.title.value} already exists. No duplicates allowed.`);
      showInputError(formElements.title);
    } else {
      const newBook = createBook(Array.from(e.target.querySelectorAll('input')));
      displayBook(insertBook(newBook));
      e.target.reset();
      e.target.elements.title.focus();
    }
  } else {
    showInputError(e.target.querySelector(':invalid'));
  }
});

// -- booksList - <ul> that contains the list of books -- //
const booksList = document.getElementById('bookslist');

// -- when we click on the delete button of a book -- //
booksList.addEventListener('click', (e) => {
  if (e.target.type === 'button') {
    removeBook(e.target.parentElement);
  }
});
