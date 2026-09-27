import { Elysia } from "elysia";
import { tickerHelper } from "./services/tickerHelper";
import { filingsRoutes } from "./routes/filings";
import { companiesRoutes } from "./routes/companies";

async function initializeApp() {
	await tickerHelper.initialize();

	const app = new Elysia();

	app.use(filingsRoutes);
	app.use(companiesRoutes);

	app.listen(3000);

	console.log(`Backend ready at http://localhost:${app.server?.port}`);
}

initializeApp();
