const URL = 'http://localhost:3001/api';

// Session managment

async function login(credentials) {
  const response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  const jresp = await response.json();
  if (response.ok) return jresp;
  else throw { status: response.status, jresp };
}

async function logout() {
  const response = await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include',
  });
  if (response.ok) return;
  else {
    const jresp = await response.json();
    throw { status: response.status, jresp };
  }
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include',
  });
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}

// GET
async function getTickets() {
  const response = await fetch(URL + '/tickets');
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}

async function getTicketInfos(id) {
  const response = await fetch(URL + `/tickets/${id}`, {
    credentials: 'include',
  });
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}

async function getAuthToken() {
  const response = await fetch(URL + '/auth-token', {
    credentials: 'include',
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw { status: response.status, token };
  }
}

// POST
async function createTextBlock(data) {
  const response = await fetch(URL + `/tickets/${data.id}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}
async function createTicket(data) {
  const response = await fetch(URL + '/tickets', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}

async function getPredictionTime(token, tickets) {
  const response = await fetch('http://localhost:3002/api/closing-prediction', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tickets }),
  });
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}

// PUT

async function updateTicketState({ id, state }) {
  const response = await fetch(URL + `/tickets/${id}/state`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, state }),
  });
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}

async function updateTicketCategoy({ id, category }) {
  const response = await fetch(URL + `/tickets/${id}/category`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, category }),
  });
  const jresp = await response.json();
  if (response.ok) {
    return jresp;
  } else {
    throw { status: response.status, jresp };
  }
}

const API = {
  login,
  logout,
  getTickets,
  getTicketInfos,
  createTextBlock,
  createTicket,
  getAuthToken,
  getPredictionTime,
  updateTicketState,
  updateTicketCategoy,
  getUserInfo,
};
export default API;
