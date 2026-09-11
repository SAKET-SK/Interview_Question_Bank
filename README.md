# Interview Q&A Bank

A simple, no-framework app for browsing scenario-based interview questions.
Each question is its own tab; click it to open the answer in a popup.

## Folder structure

interview-qa-tracker/
├── index.html          # page structure
├── css/
│   └── style.css       # all styling
├── js/
│   └── app.js          # search, modal, add/delete logic
├── data/
│   └── questions.json  # your Q&A data — edit this by hand
└── README.md

## Editing your data

Open `data/questions.json` in any text editor and add entries in this format:

{
  "id": 3,
  "company": "Amazon",
  "role": "Product Manager",
  "question": "Tell me about a time you disagreed with a decision.",
  "answer": "Your full answer goes here."
}

- `id` must be unique across all entries.
- Keep it as one big array [ {...}, {...}, {...} ].

## Running it

Because the app loads questions.json with fetch(), most browsers will
block that if you just double-click index.html (a file:// restriction,
not specific to this app). Run a tiny local server instead:

Python: python3 -m http.server 8000, then open http://localhost:8000
Node: npx serve .

## Contributing

Have a scenario-based interview question to add? Contributions are welcome!

Please submit your question by raising a pull request with **all four fields filled in** — entries
missing any field won't be accepted:

```
Company :
Role :
Question :
Answer :
```

Once submitted, it'll be added to `data/questions.json` in the format shown
above. Duplicate or near-duplicate questions may be skipped or merged with
an existing entry.

## How adding/deleting works

- Questions added via the "+ Add question" button save to your browser's
  local storage on this machine only — not into questions.json.
- Deleting a question from the JSON file removes it for everyone; deleting
  one you added through the form removes it from local storage only.
