{
  description = "Flake to develop the CDapp using nix(OS)";

  inputs = {
    nixpkgs_node.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs_node
  }: {
    devShell.x86_64-linux = with nixpkgs_node.legacyPackages.x86_64-linux;
      mkShell {
        buildInputs = [nodejs_20 pnpm_8 python3 zsh];
        shellHook = ''
          if [ -n "$SHELL" ]; then
            exec $SHELL
          fi
        '';
      };
  };
}
