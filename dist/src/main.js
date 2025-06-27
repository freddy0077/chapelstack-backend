"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_2 = require("@nestjs/core");
const all_exceptions_filter_1 = require("./base/filters/all-exceptions.filter");
const graphql_upload_1 = require("graphql-upload");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.use((0, graphql_upload_1.graphqlUploadExpress)({ maxFileSize: 5_000_000, maxFiles: 1 }));
    const httpAdapterHost = app.get(core_2.HttpAdapterHost);
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(httpAdapterHost));
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((err) => {
    console.error('Failed to bootstrap the application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map