import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { Authorization } = req.headers;
    const { id } = req.query;

    if (!Authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const method = req.method === 'GET' ? 'GET' : 'DELETE';

    const response = await fetch(`${process.env.API_URL}/appointments/${id}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Authorization as string,
      },
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'https://your-api-gateway-url.amazonaws.com',
  },
};

module.exports = nextConfig;