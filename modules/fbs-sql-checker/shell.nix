{ pkgs ? import <nixpkgs> {} }:
  let pythonWithVenv = pkgs.python310.withPackages(p: with p; [pylint black]);
  in pkgs.mkShell {
    nativeBuildInputs = [ pythonWithVenv ];
  }
