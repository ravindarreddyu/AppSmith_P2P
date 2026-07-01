export default {
	myVar1: [],
	myVar2: {},
	myFun1 () {
		//	write code here
		//	this.myVar1 = [1,2,3]
	},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	}
	,
	triggerRpaBot: async () => {
		try {

			await storeValue("isBotRunning", true);

			// 1. Authenticate and retrieve the token
			await AA_Auth.run();

			// 2. Deploy the bot using the newly generated token
			const deployResponse = await AA_DeployBot.run();

			// 3. Notify the user of a successful trigger
			showAlert('Bot triggered successfully! Deployment ID: ' + deployResponse.deploymentId, 'success');

			while (true) {

				await AA_Bot_Execution_Status.run();

				if (AA_Bot_Execution_Status.data.list[0].status === "COMPLETED") {
					showAlert('Bot execution completed successfully!', 'success');
					break;
				}

				if (AA_Bot_Execution_Status.data.list[0].status === "FAILED") {
					showAlert('Bot execution failed', 'failure');
					break;
				}

				await new Promise(resolve => setTimeout(resolve, 1000));
			}


		} catch (error) {
			// Handle and display any errors
			showAlert('Failed to trigger the bot: ' + error.message, 'error');

		}
		finally {
			resetWidget("inp_value", true);
			await storeValue("isBotRunning", false);
		}

	}
}