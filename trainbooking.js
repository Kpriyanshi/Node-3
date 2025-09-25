const express = require('express');
const app = express();
const PORT = 3000;

const seats = {
  1: { status: 'available' },
  2: { status: 'available' },
  3: { status: 'available' },
  4: { status: 'available' },
  5: { status: 'available' },
  6: { status: 'available' }
};

const LOCK_DURATION = 60000; // 1 minute lock
app.use(express.json());

// --- GET all seats ---
app.get('/seats', (req, res) => {
  res.status(200).json(seats);
});

// --- Lock a seat ---
app.post('/lock/:seatId', (req, res) => {
  const { seatId } = req.params;
  const seat = seats[seatId];

  if (!seat) return res.status(404).json({ message: "Seat not found." });
  if (seat.status !== 'available') return res.status(409).json({ message: "Seat is already locked or booked." });

  seat.status = 'locked';
  seat.lockExpiry = Date.now() + LOCK_DURATION; // dynamically add lockExpiry

  setTimeout(() => {
    if (seat.status === 'locked' && seat.lockExpiry <= Date.now()) {
      seat.status = 'available';
      delete seat.lockExpiry; // remove lockExpiry after expiry
    }
  }, LOCK_DURATION);

  res.status(200).json({ message: `Seat ${seatId} locked successfully. Confirm within 1 minute.` });
});

// --- Confirm a seat booking ---
app.post('/confirm/:seatId', (req, res) => {
  const { seatId } = req.params;
  const seat = seats[seatId];

  if (!seat) return res.status(404).json({ message: "Seat not found." });

  if (seat.status === 'locked' && seat.lockExpiry > Date.now()) {
    seat.status = 'booked';
    delete seat.lockExpiry; // remove lockExpiry after booking
    res.status(200).json({ message: `Seat ${seatId} booked successfully!` });
  } else {
    res.status(400).json({ message: "Seat is not locked and cannot be booked" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});