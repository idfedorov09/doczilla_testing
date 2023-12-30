import Properties.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import org.postgresql.util.PSQLException
import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet

class ServerRouter {

    private var conn: Connection

    init {
        val appConfig = AppConfig()
        val pgUrl = appConfig.getProperty(POSTGRES_URL())
        val pgUsername = appConfig.getProperty(POSTGRES_USERNAME())
        val pgLogin = appConfig.getProperty(POSTGRES_PASSWORD())

        conn = DriverManager.getConnection(pgUrl, pgUsername, pgLogin)
    }

    /**
     * Ручка добавления нового студента. Возвращает добавленного студента (с его id)
     */
    suspend fun putQuery(
        call: ApplicationCall,
    ) {
        try {
            val student = call.receive<Student>()
            if (student.id == null) {
                val studentId = insertNewStudent(student)
                call.respond(
                    HttpStatusCode.OK,
                    student.copy(
                        id = studentId,
                    ),
                )
            } else {
                call.respond(HttpStatusCode.BadRequest, "Invalid student id")
            }
        } catch (e: ContentTransformationException) {
            call.respond(HttpStatusCode.BadRequest, "Invalid JSON")
        } catch (e: PSQLException) {
            call.respond(HttpStatusCode.BadRequest, "${e.message}")
        }
    }

    /**
     * Ручка получения списка всех студентов
     */
    suspend fun getQuery(
        call: ApplicationCall,
    ) {
        val students = getAllStudents()
        call.respond(HttpStatusCode.OK, students)
    }

    /**
     * Ручка удаления студента по id
     */
    suspend fun deleteQuery(
        call: ApplicationCall,
    ) {
        val stringId = call.parameters["id"] ?: return
        val id = stringId.toLongOrNull() ?: run {
            call.respond(HttpStatusCode.BadRequest, "Invalid id")
            return
        }

        if (!isStudentExists(id)) {
            call.respond(HttpStatusCode.OK, "Student with id=$id is not exist")
            return
        }

        deleteStudentById(id)
        call.respond(HttpStatusCode.OK, "Success")
    }

    // хотел сделать для произвольных запросов по-быстрому, но
    // но при ошибках INSERT допустим запросов будет непонятно что случилось)
    private fun execute(query: String): ResultSet? {
        runCatching {
            conn.createStatement().let { stmt ->
                return stmt.executeQuery(query)
            }
        }
        return null
    }

    private fun insertNewStudent(student: Student): Long {
        val query = student.run {
            """
            INSERT INTO students_table (name, second_name, middle_name, birthday, study_group)
            VALUES ('$name', '$secondName', '$middleName', '$birthday', '$studyGroup')
            RETURNING id;
            """.trimIndent()
        }
        val queryResult = execute(query) ?: throw Exception("Error during execute INSERT sql")
        queryResult.next()
        return queryResult.getLong("id")
    }

    private fun deleteStudentById(studentId: Long) {
        val query = """
            DELETE FROM students_table t WHERE t.id = $studentId 
        """.trimIndent()
        execute(query)
    }

    private fun getAllStudents(): List<Student> {
        val query = """
            SELECT * FROM students_table
        """.trimIndent()
        val sqlResult = execute(query) ?: throw Exception("Error with create statement.")
        return mapResultSetToStudentList(sqlResult)
    }

    private fun mapResultSetToStudentList(resultSet: ResultSet): List<Student> {
        val studentList = mutableListOf<Student>()

        while (resultSet.next()) {
            val id = resultSet.getLong("id")
            val name = resultSet.getString("name")
            val secondName = resultSet.getString("second_name")
            val middleName = resultSet.getString("middle_name")
            val birthday = resultSet.getString("birthday")
            val studyGroup = resultSet.getString("study_group")

            val student = Student(id, name, secondName, middleName, birthday, studyGroup)
            studentList.add(student)
        }

        return studentList
    }

    private fun isStudentExists(studentId: Long): Boolean {
        val query = """
        SELECT EXISTS (SELECT 1 FROM students_table WHERE id = ?) AS student_exists;
        """.trimIndent()

        conn.prepareStatement(query).use { stmt ->
            stmt.setLong(1, studentId)
            val resultSet = stmt.executeQuery()

            if (resultSet.next()) {
                return resultSet.getBoolean("student_exists")
            }
        }
        return false
    }
}
