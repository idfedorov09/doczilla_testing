import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Student(
    val id: Long? = null,
    val name: String,
    @SerialName("second_name") val secondName: String,
    @SerialName("middle_name") val middleName: String,
    val birthday: String,
    @SerialName("study_group") val studyGroup: String,
)
