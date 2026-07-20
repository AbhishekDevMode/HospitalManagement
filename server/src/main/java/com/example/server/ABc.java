package com.example.server;

import java.util.Arrays;

public class ABc {

    static void main() {
        System.out.println("Abhishek");
        mainTest("A", "B", "a", "b", "c", "d");
    }

    public static void mainTest(String... ss) {
        System.out.println(Arrays.toString(ss));
    }

}
