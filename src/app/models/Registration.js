import Sequelize, { Model } from 'sequelize';
import { isBefore, formatDistance } from 'date-fns';
import pt from 'date-fns/locale/pt';

class Registration extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.FLOAT,
        active: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), this.end_date);
          },
        },
        daysLeft: {
          type: Sequelize.VIRTUAL,
          get() {
            return formatDistance(new Date(), this.end_date, { locale: pt });
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    this.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
  }
}

export default Registration;
