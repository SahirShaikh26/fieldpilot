require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');
const projectsRoutes = require('./routes/projects');
const customersRoutes = require('./routes/customers');
const engineersRoutes = require('./routes/engineers');
const reportsRoutes = require('./routes/reports');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/engineers', engineersRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
