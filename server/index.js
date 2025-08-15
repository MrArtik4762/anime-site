const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/source-map', require('./routes/sourceMap'));
app.use(require('./middleware/error'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server listening on :${port}`));