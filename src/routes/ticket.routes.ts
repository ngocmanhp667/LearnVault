import { Router } from 'express';
import { 
  createTicket, 
  getUserTickets, 
  getAllTickets, 
  getTicketById, 
  updateTicketStatus, 
  addTicketMessage 
} from '../controllers/ticket.controller';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// User routes
router.post('/', authenticateJWT, createTicket);
router.get('/my-tickets', authenticateJWT, getUserTickets);
router.get('/:id', authenticateJWT, getTicketById);
router.post('/:id/messages', authenticateJWT, addTicketMessage);

// Admin routes
router.get('/', authenticateJWT, authorizeRole(['Admin']), getAllTickets);
router.put('/:id/status', authenticateJWT, authorizeRole(['Admin']), updateTicketStatus);

export default router;
