ng-select-link
==============

Installation
------------

    bower install jsmarkus/ng-select-link

Usage
-----

`ng-select-link` allows create linked `<select>`s.

Let's say we need to write a form that allows to select first an author,
then a book (from the list of their books).

We have a function `getBooksByAuthor(authorId)` that returns a *promise*,
that resolves to the list of the books, found by author ID.
Doesn't matter, how it retrieves this list - via REST, from a DB or from
a testing stub - all we need is a promise.

```javascript
scope.getBooksByAuthor = function (authorId) {
  //...find author's books...
  return promise;
}
```

The code to select an author is straightforward:

```html
  <select
    ng-model="selectedAuthor"
    ng-options="author.id as author.name for author in authors"
    ></select>
```

To add a linked `<select>` we can write the following:

```html
  <select
    ng-model="selectedBook"
    ng-options="book.isbn as book.title for book in books"
    ng-select-link="getBooksByAuthor(selectedAuthor)"
    ></select>
```

An expression: `ng-select-link="getBooksByAuthor(selectedAuthor)"` tells the following:
>>"when `selectedAuthor` is changed, call `getBooksByAuthor(selectedAuthor)`, then fill the `<select>` options with the result".

For the full example see [demo](http://jsmarkus.github.io/ng-select-link/examples/demo.html) or [geo](http://jsmarkus.github.io/ng-select-link/examples/geo.html).

Advanced features
-----------------

`ng-select-link-empty` allows you define which text should be displayed when nothing is selected. In our example we could write the following:


```html
  <select
    ng-model="selectedBook"
    ng-options="book.isbn as book.title for book in books"
    ng-select-link-empty="'Select book...'"
    ></select>
```

`ng-select-link-item` gives an access to full selected object. In our example `ng-model` takes `book.isbn` as a value, because the `ng-options` are configured to pass `book.isbn`. If we want to access the book itself, we could write some kind of `getBookById()` scope function, but alternatively we can do the following:

```html
  <select
    ng-model="selectedBook"
    ng-options="book.isbn as book.title for book in books"
    ng-select-link-empty="'Select book...'"
    ng-select-link-item="fullBook"
    ></select>
```

In this case, when the user has selected some book, the `fullBook` scope variable will be set with `{isbn:..., title:...}` object, representing this book.

