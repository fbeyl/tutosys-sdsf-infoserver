import { IProfile, Session, Logger, LoggingConfigurer, ImperativeError,
    CredentialManagerFactory } from "@zowe/imperative";
import { ZosmfSession } from "@zowe/zosmf-for-zowe-sdk";
import { getDefaultProfile } from "@zowe/core-for-zowe-sdk";
import { PingTso, StartTso, StopTso } from "@zowe/zos-tso-for-zowe-sdk";

(async () => {
//Initialize the Imperative Credential Manager Factory and Logger
Logger.initLogger(LoggingConfigurer.configureLogger('lib', {name: 'test'}));
// Uncommment the below line if the Secure Credential Store is in use
// await CredentialManagerFactory.initialize({service: "Zowe-Plugin"});

// Get the default z/OSMF profile and create a z/OSMF session with it
let defaultZosmfProfile: IProfile;
let defaultTsoProfile: IProfile;
try {
   defaultZosmfProfile = await getDefaultProfile("zosmf", true);
   defaultTsoProfile = await getDefaultProfile("tso", false);
} catch (err) {
   throw new ImperativeError({msg: "Failed to get a profile."});
}

const session: Session = ZosmfSession.createBasicZosmfSession(defaultZosmfProfile);
const accountNumber = defaultTsoProfile.account;
const startResponse = await StartTso.start(session, accountNumber, {
   codePage: "285"
});

const servletKey = startResponse.servletKey;
if (startResponse.success) {
   console.log(`[${servletKey}] Started`);
} else {
   throw new Error("Failed to start TSO address space");
}

const pingResponse = await PingTso.ping(session, servletKey);
if (pingResponse.success) {
   console.log(`[${servletKey}] Ping succeeded`);
} else {
   throw new Error("Failed to ping TSO address space");
}

const stopResponse = await StopTso.stop(session, servletKey);
if (stopResponse.success) {
   console.log(`[${servletKey}] Stopped`);
} else {
   throw new Error("Failed to stop TSO address space");
}

try {
   await PingTso.ping(session, servletKey);
} catch {
   console.log(`[${servletKey}] Ping failed`);
}
})().catch((err) => {
console.error(err);
process.exit(1);
});