package ru.doczilla.testing;

import java.io.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Вспомогательный класс для выявления зависимостей
 */
public class FileDesc {

    private final Map<String, Integer> indexes;

    private final ArrayList<FileDescNode> filesArray;

    private final String rootPath;

    private List<Integer> cyclePath;

    public FileDesc(String rootPath) {
        this.rootPath = rootPath;
        filesArray = new ArrayList<>();
        indexes = new HashMap<>();

        File rootFolder = new File(rootPath);
        getAllFiles(rootFolder);

        buildDependencies();
        findCycle();

        if (cyclePath != null) {
            writeCycleDependencies();
        } else {
            writeSortedList();
        }

    }

    private void writeSortedList() {
        int n = filesArray.size();
        String outputFileName = "sorted_list.txt";
        boolean[] vis = new boolean[n];
        List<Integer> preResult = new ArrayList<>();

        for(int i = 0; i<n; i++) {
            if (!vis[i]) {
                List<Integer> newPreResult = new ArrayList<>();
                newPreResult.add(i);
                writeSortedList(i, newPreResult, vis);
                newPreResult.addAll(preResult);

                preResult = postHandle(newPreResult);
            }
        }

        try {
            File cycleOutputFile = new File(outputFileName);
            FileWriter writer = new FileWriter(outputFileName);
            cycleOutputFile.createNewFile();
            for(int i = preResult.size()-1; i>=0; i--) {
                FileDescNode curNode = filesArray.get(preResult.get(i));
                writer.write(curNode.getFileName() + System.lineSeparator());
            }
            writer.close();
        } catch (IOException e) {
            System.out.println("Error: "+e);
        }

    }

    // TODO: здесь можно применить мемоизацию для оптимизации
    private void writeSortedList(
            Integer cur,
            List<Integer> result,
            boolean[] vis
    ) {
        vis[cur] = true;
        FileDescNode curNode = filesArray.get(cur);

        for(FileDescNode node: curNode.getParents()) {
            result.add(node.getId());

            List<Integer> newResult = new ArrayList<>();
            writeSortedList(node.getId(), newResult, vis);
            result.addAll(newResult);
        }
    }

    private List<Integer> postHandle(List<Integer> preResult) {
        Deque<Integer> newResult = new ArrayDeque<>();
        Set<Integer> st = new TreeSet<>();

        for(int i = preResult.size()-1; i>=0; i--) {
            int cur = preResult.get(i);
            if (st.contains(cur)) continue;
            st.add(cur);
            newResult.addFirst(cur);
        }

        return newResult.stream().toList();
    }

    private void writeCycleDependencies() {
        String outputFileName = "cycle_by_requires.txt";

        try {
            File cycleOutputFile = new File(outputFileName);

            cycleOutputFile.createNewFile();

            FileWriter writer = new FileWriter(outputFileName);
            StringBuilder lineResult = new StringBuilder();

            for(Integer x: cyclePath) {
                FileDescNode curNode = filesArray.get(x);
                lineResult.append(curNode.getPath()).append(" --> ");
            }
            lineResult.append("|");
            writer.write(lineResult+"\n<");
            for(int i = 0; i<lineResult.length() - 2; i++) writer.write("-");
            writer.write("|\n");

            writer.close();
        } catch (IOException e) {
            System.out.println("Error: "+e);
        }
    }

    /**
     * Записывает в "concatenate_all.txt" конкатенацию файлов, отсортированных по имени
     */
    public void concatenateAllFiles() {
        List<FileDescNode> sortedFilesArray = filesArray.stream()
                        .sorted(Comparator.comparing(FileDescNode::getFileName))
                        .toList();

        String outputFileName = "concatenate_all.txt";

        try {
            File concatenateAll = new File(outputFileName);

            concatenateAll.createNewFile();

            FileWriter writer = new FileWriter(outputFileName);

            for (FileDescNode node : sortedFilesArray) {
                writer.write(node.getContent());
            }
            writer.close();
        } catch (IOException e) {
            System.out.println("Error: "+e);
        }
    }


    /**
     * Возвращает инфу, есть ли цикл в зависимостях
     * Если есть, то после вызова массив cyclePath будет содержать id файлов с циклической зависимостью
     */
    private boolean findCycle() {
        int n = filesArray.size();
        int[] color = new int[n];
        ArrayList<Integer> initialPath = new ArrayList<>();

        for(int i = 0; i<n; i++) {
            if (color[i] == 0 && dfs(i, color, initialPath)) {
                return true;
            }
        }
        return false;
    }

    private boolean dfs(Integer cur, int[] color, ArrayList<Integer> path) {
        color[cur] = 1;
        ArrayList<Integer> nextPath = (ArrayList<Integer>) path.clone();
        nextPath.add(cur);

        for(FileDescNode node: filesArray.get(cur).getDependent()) {
            if (color[node.getId()] == 0 && dfs(node.getId(), color, nextPath)) {
                color[cur] = 2;
                return true;
            }
            if (color[node.getId()] == 1) {
                cyclePath = nextPath;
                color[cur] = 2;
                return true;
            }
        }
        color[cur] = 2;
        return false;
    }

    /**
     * Строит граф зависимостей
     */
    private void buildDependencies() {
        for(int i = 0; i<filesArray.size(); i++) {
            FileDescNode fileDesc = filesArray.get(i);
            List<Integer> requiresIndexes = getRequires(fileDesc);
            for(Integer index: requiresIndexes) {
                FileDescNode currentNode = filesArray.get(index);
                currentNode.addDependent(fileDesc);
                fileDesc.addParent(currentNode);
            }
        }
    }

    private void getAllFiles(File currentFolder) {
        File[] files = currentFolder.listFiles();
        if (files == null) return;

        for(File file: files) {
            if (file.isDirectory()) getAllFiles(file);
            if (file.isFile()) {
                FileDescNode node = new FileDescNode(
                        filesArray.size(),
                        file.getPath()
                );
                filesArray.add(node);
                indexes.put(
                        node.getPath(),
                        node.getId()
                );
            }
        }
    }

    /**
     * Строит лист айдишников файлов, от которых зависит текущий currentFileDesc
     */
    private List<Integer> getRequires(FileDescNode currentFileDesc) {
        List<Integer> requiredIndexes = new ArrayList<>();
        String filePath = currentFileDesc.getPath();

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Integer index = extractRequireDirectives(line);
                if (index != null) requiredIndexes.add(index);
            }
        } catch (IOException e) {
            System.out.println("Error: "+e);
            return requiredIndexes;
        }

        return requiredIndexes;
    }

    private Integer extractRequireDirectives(String line) {
        String regex = "^require\\s+['\"](.*?)['\"]$";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(line);

        if (matcher.matches()) {
            String path = rootPath + "/" + matcher.group(1);
            return indexes.get(path);
        }

        return null;
    }
}
