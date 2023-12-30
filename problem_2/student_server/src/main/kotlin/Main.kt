import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    configureRouting()
    configureSerialization()
}

fun Application.configureRouting() {
    val serverRouter = ServerRouter()
    routing {
        studentRouting(serverRouter)
    }
}

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json()
    }
}

fun Route.studentRouting(
    serverRouter: ServerRouter,
) {
    route("/students/api") {
        put {
            serverRouter.putQuery(call)
        }
        delete("{id?}") {
            serverRouter.deleteQuery(call)
        }
        get {
            serverRouter.getQuery(call)
        }
    }
}
