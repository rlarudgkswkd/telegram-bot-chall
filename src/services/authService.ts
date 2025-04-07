import jwt from 'jsonwebtoken';
import { DatabaseService } from './databaseService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';

export class AuthService {
  private static instance: AuthService | null = null;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async generateToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  }

  public async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  public async getUserFromToken(token: string): Promise<any | null> {
    const decoded = await this.verifyToken(token);
    if (!decoded) return null;

    return await this.db.getUserById(decoded.userId);
  }

  public async loginWithEmail(email: string): Promise<string | null> {
    try {
      const user = await this.db.getUserByEmail(email);
      if (!user) return null;

      return this.generateToken(user.id);
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }
} 