import * as Yup from 'yup';
import Sequelize from 'sequelize';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { name = '' } = req.query;

    const { Op } = Sequelize;

    const query = `%${name}%`;

    const users = await User.findAll({
      where: {
        name: { [Op.like]: query },
      },
      order: ['name'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(users);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      profile_admin: Yup.boolean(false),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, profile_admin, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      profile_admin,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      profile_admin: Yup.boolean(),
      email: Yup.string().email(),
      oldpassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldpassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, profile_admin } = await user.update(req.body);

    return res.json({
      id,
      name,
      profile_admin,
      email,
    });
  }
}

export default new UserController();
