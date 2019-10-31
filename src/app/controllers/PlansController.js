import * as Yup from 'yup';
import Plan from '../models/Plan';
import User from '../models/User';

class PlansController {
  async index(req, res) {
    /**
     * Pagination
     */
    const { page = 1 } = req.query;

    const plans = await Plan.findAll({
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    /**
     * Check user is administrator
     */
    const user = await User.findByPk(req.userId);

    if (!user.profile_admin) {
      return res
        .status(405)
        .json({ error: 'Action allowed for administrators only!' });
    }

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const planManagementExists = await Plan.findOne({
      where: { title },
    });

    if (planManagementExists) {
      return res.status(400).json({ error: 'Plan already exists.' });
    }

    /**
     * Check user is administrator
     */
    const user = await User.findByPk(req.userId);

    if (!user.profile_admin) {
      return res
        .status(405)
        .json({ error: 'Action allowed for administrators only!' });
    }

    const { id, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().integer(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const plan = await Plan.findByPk(req.params.id);

    if (title !== plan.title) {
      const planExists = await Plan.findOne({ where: { title } });

      if (planExists) {
        return res.status(400).json({ error: 'Title of plan already exists.' });
      }
    }

    /**
     * Check user is administrator
     */
    const user = await User.findByPk(req.userId);

    if (!user.profile_admin) {
      return res
        .status(405)
        .json({ error: 'Action allowed for administrators only!' });
    }

    const { id, duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    if (!req.params.id) {
      return res.status(401).json({ error: 'Incorret Params' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid Plan' });
    }

    await plan.destroy({ where: { id: req.params.id } });

    return res.json({ Success: `Plan ${plan.title}, Successfully deleted!` });
  }
}

export default new PlansController();
