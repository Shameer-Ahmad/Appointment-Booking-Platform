import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { Authorization } = req.headers;

    if (!Authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const method = req.method === 'GET' ? 'GET' : 'POST';
    const body = method === 'POST' ? JSON.stringify(req.body) : undefined;

    const response = await fetch(`${process.env.API_URL}/appointments`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Authorization as string,
      },
      body,
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
