package ru.doczilla.testing;

public class Main {

    public static void main(String[] args) {
        String workdir = getPath(args);

        new FileDesc(workdir)
                .concatenateAllFiles();
    }

    private static String getPath(String[] args) {
        String folderPath = null;

        for (String arg : args) {
            if (arg.startsWith("--folder=")) {
                folderPath = arg.substring("--folder=".length());
                if (folderPath.charAt(folderPath.length() - 1) == '/') {
                    folderPath = folderPath.substring(0, folderPath.length() - 1);
                }
                break;
            }
        }

        if (folderPath == null) {
            folderPath = ".";
        }

        return folderPath;
    }

}