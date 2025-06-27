"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const event_entity_1 = require("./entities/event.entity");
const create_event_input_1 = require("./dto/create-event.input");
const update_event_input_1 = require("./dto/update-event.input");
let EventsResolver = class EventsResolver {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    toGraphQLEvent(prismaEvent) {
        if (!prismaEvent) {
            throw new Error('Event not found');
        }
        return {
            ...prismaEvent,
            description: prismaEvent.description ?? undefined,
            endDate: prismaEvent.endDate ?? undefined,
            location: prismaEvent.location ?? undefined,
            category: prismaEvent.category ?? undefined,
            branchId: prismaEvent.branchId ?? undefined,
            organisationId: prismaEvent.organisationId ?? undefined,
            createdBy: prismaEvent.createdBy ?? undefined,
            updatedBy: prismaEvent.updatedBy ?? undefined,
        };
    }
    async createEvent(input) {
        console.log('EventsResolver.createEvent received input:', input);
        console.log('Input type:', typeof input);
        console.log('Input has title:', input?.title);
        console.log('Input has startDate:', input?.startDate);
        console.log('Input startDate type:', input?.startDate ? typeof input.startDate : 'N/A');
        console.log('Input keys:', Object.keys(input || {}));
        if (!input || !input.title) {
            console.error('Input validation failed: Missing title');
            throw new Error('Event title is required');
        }
        if (input.startDate && typeof input.startDate === 'string') {
            input.startDate = new Date(input.startDate);
        }
        if (input.endDate && typeof input.endDate === 'string') {
            input.endDate = new Date(input.endDate);
        }
        const createdEvent = await this.eventsService.create(input);
        return this.toGraphQLEvent(createdEvent);
    }
    async findAll(branchId, organisationId) {
        const events = await this.eventsService.findAll({
            branchId,
            organisationId,
        });
        return events.map((event) => this.toGraphQLEvent(event));
    }
    async findOne(id) {
        const event = await this.eventsService.findOne(id);
        return this.toGraphQLEvent(event);
    }
    async updateEvent(input) {
        console.log('EventsResolver.updateEvent received input:', input);
        if (input.startDate && typeof input.startDate === 'string') {
            input.startDate = new Date(input.startDate);
        }
        if (input.endDate && typeof input.endDate === 'string') {
            input.endDate = new Date(input.endDate);
        }
        const updated = await this.eventsService.update(input.id, input);
        return this.toGraphQLEvent(updated);
    }
    async removeEvent(id) {
        const removed = await this.eventsService.remove(id);
        return this.toGraphQLEvent(removed);
    }
};
exports.EventsResolver = EventsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => event_entity_1.Event),
    __param(0, (0, graphql_1.Args)('input', { type: () => create_event_input_1.CreateEventInput }, new common_1.ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_input_1.CreateEventInput]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "createEvent", null);
__decorate([
    (0, graphql_1.Query)(() => [event_entity_1.Event], { name: 'events' }),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => event_entity_1.Event, { name: 'event' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => event_entity_1.Event),
    __param(0, (0, graphql_1.Args)('input', { type: () => update_event_input_1.UpdateEventInput }, new common_1.ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_event_input_1.UpdateEventInput]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "updateEvent", null);
__decorate([
    (0, graphql_1.Mutation)(() => event_entity_1.Event),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "removeEvent", null);
exports.EventsResolver = EventsResolver = __decorate([
    (0, graphql_1.Resolver)(() => event_entity_1.Event),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsResolver);
//# sourceMappingURL=events.resolver.js.map