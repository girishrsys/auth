import { FirmSession, FirmSessionModel, IFirmSession } from "../models/session.model";
import { BaseService } from "./base.service";
import { SessionStatus } from "../enums";

export class SessionService extends BaseService {

    constructor() {
        super(FirmSessionModel);
    }
    async createSession(sessionDetail: FirmSession) {
        try {
            const { firmId, status } = sessionDetail;
            return new FirmSessionModel({
                firmId,
                status
            }).save();

        } catch (err) {
            throw err;
        }
    }

    async activeSesssionsFirm(firmId: string) {
        try {
            return this.find<IFirmSession>({ firmId: firmId, status: SessionStatus.ACTIVE }, "_id firmId");
        } catch (err) {
            throw err;
        }
    }

    async deleteSessions(firmId: string) {
        try {
            return FirmSessionModel.updateMany({ firmId }, { status: SessionStatus.RESTRICTED });
        } catch (err) {
            throw err;
        }
    }
}

export const sessionService = new SessionService();