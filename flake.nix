{
  description = "Flake to develop ABIs using nix(OS)";

  inputs = {
    nixpkgs_node.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs_node,
  }: {
    devShell.x86_64-linux = with nixpkgs_node.legacyPackages.x86_64-linux;
      mkShell {
        buildInputs = [nodejs_20 pnpm_8 zsh];
        shellHook = "exec zsh";
      };
  };
}
