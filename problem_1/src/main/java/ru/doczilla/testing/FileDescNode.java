package ru.doczilla.testing;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Описывает файл для решения поставленной задачи
 */
public class FileDescNode {

    private Integer id;
    private String path;
    private String fileName;

    private ArrayList<FileDescNode> parents;

    /**
     * Список зависимых файлов
     */
    private List<FileDescNode> dependent;

    public FileDescNode(int id, String path) {
        this.id = id;
        this.path = path;
        fileName = Paths.get(path).getFileName().toString();

        dependent = new ArrayList<>();
        parents = new ArrayList<>();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public ArrayList<FileDescNode> getParents() {
        return parents;
    }

    public void setParents(ArrayList<FileDescNode> parents) {
        this.parents = parents;
    }

    public List<FileDescNode> getDependent() {
        return dependent;
    }

    public void addDependent(FileDescNode node) {
        dependent.add(node);
    }

    public void setDependent(List<FileDescNode> dependent) {
        this.dependent = dependent;
    }

    public void addParent(FileDescNode node) {
        parents.add(node);
    }

    public boolean hasParents() {
        return !parents.isEmpty();
    }

    public String getContent() {
        StringBuilder content = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append(System.lineSeparator());
            }
        } catch (IOException e) {
            System.out.println("Error: "+e);
            return null;
        }

        return content.toString();
    }

}
