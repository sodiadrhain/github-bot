import { exec } from 'node:child_process';

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

export default (app) => {
  app.log.info("Bot Active 🎉");

  app.on("pull_request.opened", async (context) => {
    const params = context.issue({ 
      body: "PR will be deployed once reviewed and merged.",
      issue_number: context.payload.pull_request.number,
    });

    return context.octokit.issues.createComment(params);
  });

  app.on("pull_request.closed", async (context) => {
    const params = context.issue({ 
      body: "PR is being deployed, deployment status will be shared shortly.",
      issue_number: context.payload.pull_request.number,
    });

    context.octokit.issues.createComment(params);

   const repoUrl = context.payload.repository.html_url + ".git"
   const repoName = context.payload.repository.name

    exec(`bash deploy.sh ${repoUrl} ${repoName}`, (error, stdout) => {
      if (error) {
        console.error(`An error occured: ${error}`);
        return;
      }
      console.log(stdout);

      if (stdout == "deployment complete") {
        const params = context.issue({ 
          body: "PR Deployed 🎉\n\n App running on " + process.env.API_URL + ":5000",
          issue_number: context.payload.pull_request.number,
        });
  
        context.octokit.issues.createComment(params);
      }
    });
    return;
  });

};
