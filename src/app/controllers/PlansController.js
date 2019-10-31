import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlansController {
  /* async index(req, res) {
    return res.json();
  } */

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

    const { id, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }
  /*
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

    const planManagement = await PlanManagement.findByPk(req.params.id);

    return res.json();
  }

  async delete(req, res) {
    return res.json();
  } */
}

export default new PlansController();
