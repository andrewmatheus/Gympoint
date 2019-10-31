import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import Auth from '../../config/auth';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'user not found' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, profile_admin } = user;

    return res.json({
      user: {
        id,
        name,
        profile_admin,
        email,
      },
      token: jwt.sign({ id }, Auth.secret, {
        expiresIn: Auth.expiresIn,
      }),
    });
  }
}

export default new SessionController();
