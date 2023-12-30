import java.io.InputStream
import java.util.Properties

class AppConfig {
    private val properties = Properties()

    init {
        val inputStream: InputStream? = javaClass.classLoader.getResourceAsStream("application.properties")
        properties.load(inputStream)
    }

    fun getProperty(key: String): String {
        return properties.getProperty(key)
    }
}