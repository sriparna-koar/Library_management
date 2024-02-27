





const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Book = require('./models/book');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://koarsk03:glMRbP3FZbbKnOC1@cluster0.oby5ugh.mongodb.net/', {

});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
      const books = await Book.find();
      res.render('index', { books }); 
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

app.post('/search', async (req, res) => {
  const { title, author, category } = req.body;
  try {
  
    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' }; 
    if (author) query.author = { $regex: author, $options: 'i' }; 
    if (category) query.category = category;

    const books = await Book.find(query);
    res.render('index', { books });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).send('Book not found');
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/share/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    book.available = false;
    await book.save();
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/books/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const books = await Book.find({ category });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/books', async (req, res) => {
  const { title, author, category, folder } = req.body; 
  try {
    const newBook = new Book({ title, author, category, folder });
    await newBook.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/searchByFolder', async (req, res) => {
  const { folder } = req.body;
  try {
    const books = await Book.find({ folder }); 
    if (books.length > 0) {

      res.render('index', { books, folder });
    } else {

      res.render('index', { books: [], folder, message: 'No books available in this folder.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/autocomplete', async (req, res) => {
  const { term } = req.query;
  try {

    const titles = await Book.find({ title: { $regex: term, $options: 'i' } }, 'title');
    const suggestions = titles.map(book => book.title);
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/deleteBook/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`/books/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      console.log('Book deleted successfully');
      res.sendStatus(200);
    } else {
      console.error('Failed to delete book');
      res.sendStatus(500);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
app.post('/add-to-folder', async (req, res) => {
  const { bookId, folderName } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    book.folder = folderName; 
    await book.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
