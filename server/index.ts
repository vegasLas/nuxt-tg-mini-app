import express from 'express';
import appointmentsRouter from './api/appointments';
import usersRouter from './api/users';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/appointments', appointmentsRouter);
app.use('/api/users', usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});