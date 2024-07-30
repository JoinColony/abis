{
  description = "Flake to develop the CDapp using nix(OS)";

  inputs = {
    # node 20.15.1
    nixpkgs_node.url = "github:NixOS/nixpkgs/master";
  };

  outputs = {
    self,
    nixpkgs_node
  }: {
    devShell.x86_64-linux = with nixpkgs_node.legacyPackages.x86_64-linux;
      mkShell {
        buildInputs = [nodejs_20 nodePackages.pnpm python3 zsh];
        shellHook = ''
          if [ -n "$SHELL" ]; then
            exec $SHELL
          fi
        '';
      };
  };
}
