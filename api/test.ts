import { MOCK_USER } from '../constants.js';

export default function handler(req: any, res: any) {
  res.status(200).json({ status: "test ok", user: MOCK_USER.name, time: new Date().toISOString() });
}
