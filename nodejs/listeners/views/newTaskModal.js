const { User, Task } = require('../../models');
const { modals } = require('../../user-interface');
const { reloadAppHome } = require('../../utilities');

module.exports = (app) => {
  app.view('new-task-modal', async ({
    ack, view, body, client,
  }) => {
    try {
      const queryResult = await User.findOrCreate({
        where: {
          slackUserID: body.user.id,
          slackWorkspaceID: body.team.id,
        },
        include: [
          Task,
        ],
      });
      const user = queryResult[0];

      user.createTask({
        title: view.state.values.taskTitle.taskTitle.value,
      });

      await user.save();
      await ack(
        {
          response_action: 'update',
          view: modals.taskCreated(view.state.values.taskTitle.taskTitle.value),
        },
      );
      await reloadAppHome(client, body.user.id, body.team.id);
    } catch (error) {
      await ack(
        {
          response_action: 'update',
          view: modals.taskCreationError(view.state.values.taskTitle.taskTitle.value),
        },
      );
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });
};
