import React from 'react';
import { Offcanvas, Button, ListGroup, Image, Form, Alert } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const Cart = ({ show, handleClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };
  
  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 50000 ? 0 : 5000;
  const total = subtotal + deliveryFee;
  
  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" size="lg">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Your Cart ({cartItems.length} items)</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <p>Your cart is empty</p>
            <Button variant="primary" onClick={handleClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.id} className="py-3">
                  <div className="d-flex gap-3">
                    <Image 
                      src={item.image || 'https://via.placeholder.com/60x60?text=Food'} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      rounded
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{item.name}</h6>
                        <Button 
                          variant="link" 
                          className="text-danger p-0"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="d-flex align-items-center gap-2">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <FaMinus size={10} />
                          </Button>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            style={{ width: '60px', textAlign: 'center' }}
                            size="sm"
                          />
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <FaPlus size={10} />
                          </Button>
                        </div>
                        <span className="text-primary fw-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
            <div className="mt-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee:</span>
                <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">{formatCurrency(total)}</strong>
              </div>
              {subtotal < 50000 && subtotal > 0 && (
                <Alert variant="info" className="small">
                  Add {formatCurrency(50000 - subtotal)} more to get free delivery!
                </Alert>
              )}
              <Button 
                variant="primary" 
                className="w-100" 
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Cart;