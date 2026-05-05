import React, { useState } from 'react';
import { Container, Row, Col, Table, Badge, Button, Form, InputGroup, Card } from 'react-bootstrap';

const mockOrders = [
  { id: '#4521', table: 'Table 3', items: ['Grilled Salmon', 'Caesar Salad', 'Sparkling Water'], total: 58.50, status: 'preparing', time: '2 min ago', server: 'Amara K.', guests: 2, priority: 'high' },
  { id: '#4520', table: 'Table 7', items: ['Ribeye Steak', 'Truffle Fries', 'Red Wine x2'], total: 124.00, status: 'ready', time: '8 min ago', server: 'James O.', guests: 4, priority: 'normal' },
  { id: '#4519', table: 'Takeout', items: ['Margherita Pizza', 'Tiramisu'], total: 34.00, status: 'delivered', time: '14 min ago', server: 'Priya N.', guests: 1, priority: 'normal' },
  { id: '#4518', table: 'Table 1', items: ['Mushroom Risotto', 'Garlic Bread', 'House Wine'], total: 67.25, status: 'new', time: 'just now', server: 'Amara K.', guests: 3, priority: 'high' },
  { id: '#4517', table: 'Table 12', items: ['Pasta Carbonara', 'Bruschetta', 'Lemonade x2'], total: 45.80, status: 'preparing', time: '5 min ago', server: 'James O.', guests: 2, priority: 'normal' },
  { id: '#4516', table: 'Table 5', items: ['Beef Burger', 'Onion Rings', 'Craft Beer'], total: 38.00, status: 'ready', time: '11 min ago', server: 'Priya N.', guests: 1, priority: 'normal' },
  { id: '#4515', table: 'Table 9', items: ['Seafood Pasta', 'Caprese Salad', 'White Wine x2', 'Crème Brûlée'], total: 92.00, status: 'delivered', time: '22 min ago', server: 'James O.', guests: 3, priority: 'normal' },
];

const STATUS_META = {
  new:       { label: 'New',       variant: 'success' },
  preparing: { label: 'Preparing', variant: 'warning' },
  ready:     { label: 'Ready',     variant: 'primary' },
  delivered: { label: 'Delivered', variant: 'secondary' },
};

const NEXT_STATUS = { new: 'preparing', preparing: 'ready', ready: 'delivered' };

const Order = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const advance = (id) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id && NEXT_STATUS[o.status]
          ? { ...o, status: NEXT_STATUS[o.status] }
          : o
      )
    );
  };

  const counts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.table.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some(i => i.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const revenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <Container fluid className="py-4 px-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>

      {/* Page Header */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold mb-0" style={{ fontSize: 26 }}>Orders</h2>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Live kitchen & floor view · {filtered.length} orders shown
          </p>
        </Col>
        <Col xs="auto">
          <span className="text-muted" style={{ fontSize: 13 }}>
            {new Date().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: '0.06em' }}>Active Orders</p>
              <h3 className="fw-bold mb-1">{counts.new + counts.preparing + counts.ready}</h3>
              <small className="text-success">↑ +3 this hour</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: '0.06em' }}>Avg. Ticket</p>
              <h3 className="fw-bold mb-1">
                ${(orders.reduce((s, o) => s + o.total, 0) / orders.length).toFixed(0)}
              </h3>
              <small className="text-success">↑ +$4 vs yesterday</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: '0.06em' }}>Delivered Today</p>
              <h3 className="fw-bold mb-1">{counts.delivered}</h3>
              <small className="text-muted">On track</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: '0.06em' }}>Today's Revenue</p>
              <h3 className="fw-bold mb-1">${revenue.toFixed(2)}</h3>
              <small className="text-success">↑ +12% vs last week</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters & Search */}
      <Row className="align-items-center mb-3 g-2">
        <Col xs="auto" className="d-flex gap-2 flex-wrap">
          {[
            ['all', 'All'],
            ['new', 'New'],
            ['preparing', 'Preparing'],
            ['ready', 'Ready'],
            ['delivered', 'Delivered'],
          ].map(([val, lbl]) => (
            <Button
              key={val}
              size="sm"
              variant={filter === val ? 'dark' : 'outline-secondary'}
              className="rounded-pill"
              onClick={() => setFilter(val)}
            >
              {lbl}{' '}
              <Badge bg={filter === val ? 'light' : 'secondary'} text="dark" pill>
                {counts[val]}
              </Badge>
            </Button>
          ))}
        </Col>
        <Col xs={12} md="auto" className="ms-md-auto">
          <InputGroup size="sm" style={{ maxWidth: 240 }}>
            <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
            <Form.Control
              className="border-start-0"
              placeholder="Search orders, tables…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Order</th>
                <th style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Items</th>
                <th style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Server</th>
                <th style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Total</th>
                <th style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Status</th>
                <th style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Time</th>
                <th style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div className="fw-bold" style={{ fontSize: 14 }}>
                        {o.priority === 'high' && (
                          <span className="text-danger me-1" style={{ fontSize: 10 }}>●</span>
                        )}
                        {o.id}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {o.table} · {o.guests} guest{o.guests !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 14 }}>{o.items[0]}</div>
                      {o.items.length > 1 && (
                        <div className="text-muted" style={{ fontSize: 12 }}>+{o.items.length - 1} more</div>
                      )}
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 13 }}>{o.server}</span>
                    </td>
                    <td>
                      <span className="fw-bold">${o.total.toFixed(2)}</span>
                    </td>
                    <td>
                      <Badge bg={STATUS_META[o.status].variant} className="rounded-pill px-3 py-2">
                        {STATUS_META[o.status].label}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12 }}>{o.time}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {NEXT_STATUS[o.status] ? (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => advance(o.id)}
                          >
                            → {STATUS_META[NEXT_STATUS[o.status]].label}
                          </Button>
                        ) : (
                          <span className="text-muted" style={{ fontSize: 12 }}>Complete</span>
                        )}
                        <Button size="sm" variant="outline-secondary">View</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

    </Container>
  );
};

export default Order;